"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { tipsApi } from "@/lib/services/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, ThumbsUp, ThumbsDown, Flag, Plus, TrendingUp, Clock } from "lucide-react";
import type { Tip } from "@/lib/types";

export default function Guides() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");

  const { data: tips = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsApi.getAll
  });

  const filteredTips = tips
    .filter(tip => 
      tip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "votes") return b.votes - a.votes;
      const timeA = a.datePosted ? new Date(a.datePosted).getTime() : 0;
      const timeB = b.datePosted ? new Date(b.datePosted).getTime() : 0;
      return timeB - timeA;
    });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
            <BookOpen size={32} />
            Community Guides
          </h1>
          <AddTipDialog />
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              placeholder="Search tips and guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-cyan-500/20"
            />
          </div>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-900/50 border-cyan-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="votes">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} />
                  Top Rated
                </div>
              </SelectItem>
              <SelectItem value="recent">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  Newest
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tips List */}
        {filteredTips.length > 0 ? (
          <div className="space-y-4">
            {filteredTips.map((tip, index) => (
              <TipCard key={tip.id} tip={tip} index={index} />
            ))}
          </div>
        ) : (
          <Card className="bg-slate-900/50 border-cyan-500/20 p-12">
            <div className="text-center text-slate-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No tips found</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function TipCard({ tip, index }: { tip: Tip; index: number }) {
  const [votes, setVotes] = useState(tip.votes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  const handleVote = async (direction: "up" | "down") => {
    if (userVote === direction) {
      setUserVote(null);
      setVotes(votes + (direction === "up" ? -1 : 1));
    } else {
      const change = direction === "up" ? 1 : -1;
      const prevChange = userVote === "up" ? -1 : userVote === "down" ? 1 : 0;
      setVotes(votes + change + prevChange);
      setUserVote(direction);
    }
    await tipsApi.vote(tip.id, direction);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 p-6">
        <div className="flex gap-4">
          {/* Vote Controls */}
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("up")}
              className={`p-2 ${userVote === "up" ? "text-cyan-400" : "text-slate-400"}`}
            >
              <ThumbsUp size={20} />
            </Button>
            <span className={`font-semibold ${votes > 0 ? "text-cyan-400" : "text-slate-400"}`}>
              {votes}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("down")}
              className={`p-2 ${userVote === "down" ? "text-red-400" : "text-slate-400"}`}
            >
              <ThumbsDown size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            <p className="text-slate-200 leading-relaxed">{tip.content}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tip.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Author Info */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 border border-cyan-500/30">
                  <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs">
                    {tip.author.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-300">{tip.author.name}</p>
                  <p className="text-xs text-slate-500">Reputation: {tip.author.reputation}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">{tip.datePosted}</span>
                <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-red-400">
                  <Flag size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function AddTipDialog() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;

    await tipsApi.create({
      author: {
        name: "You",
        avatar: "",
        reputation: 0
      },
      content: content.trim(),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      votes: 0
    });

    setContent("");
    setTags("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          <Plus size={20} />
          Add Tip
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Share Your Knowledge</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Textarea
            placeholder="Share a helpful tip or strategy..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] bg-slate-800/50 border-cyan-500/20"
          />
          <Input
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="bg-slate-800/50 border-cyan-500/20"
          />
          <Button 
            onClick={handleSubmit}
            className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
          >
            Submit Tip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
