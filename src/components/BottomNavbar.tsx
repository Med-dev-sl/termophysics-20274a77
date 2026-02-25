import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: MessageSquare, label: "AI Chat", path: "/chat" },
        { icon: BookOpen, label: "Classrooms", path: "/dashboard" }, // Can be filtered or separate page later
        { icon: User, label: "Profile", path: "/profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border sm:hidden pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors active-scale",
                                isActive ? "text-termo-light-orange" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
