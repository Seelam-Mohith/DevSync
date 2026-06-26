import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Users, Plus, LogIn, Copy, Check, LogOut, Trash2, Loader2 } from "lucide-react";
import CreateSquadModal from "./CreateSquadModal";
import JoinSquadModal from "./JoinSquadModal";
import useAuth from "../hooks/useAuth";
import api from "../lib/api";

const SquadPanel = ({ squad, onSquadChange }) => {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isLeader = squad && user && String(squad.leader?._id) === String(user?.id);

  const copyCode = () => {
    navigator.clipboard.writeText(squad.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await api.post("/squads/leave");
      if (onSquadChange) onSquadChange(null);
    } catch {
    } finally {
      setLeaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete("/squads");
      if (onSquadChange) onSquadChange(null);
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  if (squad) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
                <Users size={20} className="text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white truncate">{squad.name}</h3>
                <p className="text-xs text-slate-400">
                  {squad.members?.length || 1} member{(squad.members?.length || 1) > 1 ? "s" : ""}
                  {squad.leader?.name ? ` · Led by ${squad.leader.name}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10"
              >
                {copied ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <Copy size={14} />
                )}
                {copied ? "Copied!" : squad.inviteCode}
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeave}
                disabled={leaving}
                className="text-red-400 hover:text-red-300"
              >
                {leaving ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
              </Button>

              {isLeader && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-red-400 hover:text-red-300"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </Button>
              )}
            </div>
          </div>
        </CardContent>

        <CreateSquadModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSquadCreated={onSquadChange} />
        <JoinSquadModal isOpen={showJoin} onClose={() => setShowJoin(false)} onSquadJoined={onSquadChange} />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                <Users size={20} className="text-slate-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Squad</h3>
                <p className="text-xs text-slate-400">Compete with friends</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
                <Plus size={14} className="mr-1" />
                Create
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowJoin(true)}>
                <LogIn size={14} className="mr-1" />
                Join
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateSquadModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSquadCreated={onSquadChange} />
      <JoinSquadModal isOpen={showJoin} onClose={() => setShowJoin(false)} onSquadJoined={onSquadChange} />
    </>
  );
};

export default SquadPanel;
