import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BottomNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: MessageSquare, label: "AI Chat", path: "/chat" },
        { icon: BookOpen, label: "Classrooms", path: "/dashboard" },
        { icon: User, label: "Profile", path: "/profile" },
    ];

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border sm:hidden pb-safe"
        >
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <motion.button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            whileTap={{ scale: 0.85 }}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
                                isActive ? "text-termo-light-orange" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <motion.div
                                animate={isActive ? { y: -2, scale: 1.15 } : { y: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                                <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            </motion.div>
                            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute -top-[1px] left-1/4 right-1/4 h-0.5 bg-termo-light-orange rounded-full"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}
