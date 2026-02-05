 import React from "react";
 import { MapPin, Building2, Briefcase, Calendar } from "lucide-react";
 import { WorkHistoryEntry } from "@/lib/constants";
 import { format } from "date-fns";
 
 interface WorkHistoryTimelineProps {
   history: WorkHistoryEntry[];
 }
 
 const WorkHistoryTimeline: React.FC<WorkHistoryTimelineProps> = ({ history }) => {
   // Reverse to show most recent first
   const sortedHistory = [...history].reverse();
 
   return (
     <div className="space-y-4">
       <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
         <Calendar className="w-5 h-5 text-primary" />
         Work History
       </h3>
 
       <div className="relative">
         {/* Timeline line */}
         <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-muted" />
 
         <div className="space-y-4">
           {sortedHistory.map((entry, index) => {
             const isLatest = index === 0;
             const fromDate = new Date(entry.fromDate);
             const toDate = entry.toDate === "Present" ? null : new Date(entry.toDate);
 
             return (
               <div
                 key={`${entry.city}-${entry.fromDate}`}
                 className={`relative pl-10 ${isLatest ? "animate-fade-in" : ""}`}
               >
                 {/* Timeline dot */}
                 <div
                   className={`absolute left-2 top-4 w-4 h-4 rounded-full border-2 ${
                     isLatest
                       ? "bg-primary border-primary shadow-lg shadow-primary/30"
                       : "bg-muted border-border"
                   }`}
                 />
 
                 <div
                   className={`p-4 rounded-xl border transition-all ${
                     isLatest
                       ? "bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30 shadow-sm"
                       : "bg-muted/30 border-border/50 hover:bg-muted/50"
                   }`}
                 >
                   {/* Duration badge */}
                   <div className="flex items-center justify-between mb-3">
                     <span
                       className={`text-xs font-medium px-2 py-1 rounded-full ${
                         isLatest
                           ? "bg-primary/20 text-primary"
                           : "bg-muted text-muted-foreground"
                       }`}
                     >
                       {entry.durationYears} {entry.durationYears === 1 ? "year" : "years"}
                     </span>
                     {isLatest && (
                       <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full">
                         Current
                       </span>
                     )}
                   </div>
 
                   {/* Position */}
                   <div className="flex items-center gap-2 mb-2">
                     <Briefcase className={`w-4 h-4 ${isLatest ? "text-primary" : "text-muted-foreground"}`} />
                     <span className={`font-semibold ${isLatest ? "text-foreground" : "text-foreground/80"}`}>
                       {entry.position}
                     </span>
                   </div>
 
                   {/* Hospital */}
                   <div className="flex items-center gap-2 mb-2">
                     <Building2 className={`w-4 h-4 ${isLatest ? "text-secondary" : "text-muted-foreground"}`} />
                     <span className="text-sm text-muted-foreground">{entry.hospitalName}</span>
                   </div>
 
                   {/* City */}
                   <div className="flex items-center gap-2 mb-2">
                     <MapPin className={`w-4 h-4 ${isLatest ? "text-accent-foreground" : "text-muted-foreground"}`} />
                     <span className="text-sm text-muted-foreground">{entry.city}</span>
                   </div>
 
                   {/* Date range */}
                   <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                     {format(fromDate, "MMM yyyy")} — {toDate ? format(toDate, "MMM yyyy") : "Present"}
                   </div>
                 </div>
               </div>
             );
           })}
         </div>
       </div>
     </div>
   );
 };
 
 export default WorkHistoryTimeline;