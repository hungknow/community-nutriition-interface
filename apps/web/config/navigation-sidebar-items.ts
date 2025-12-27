import { Baby, LucideIcon, Weight } from "lucide-react";

export interface NavSubItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    comingSoon?: boolean;
    newTab?: boolean;
    isNew?: boolean;
}

export interface NavMainItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    subItems?: NavSubItem[];
    comingSoon?: boolean;
    newTab?: boolean;
    isNew?: boolean;
}

export interface NavGroup {
    id: number;
    label?: string;
    icon?: LucideIcon;
    items: NavMainItem[];
}

export const navSidebarItems: NavGroup[] = [
    {
        id: 1,
        label: "Tools for children",
        icon: Baby,
        items: [
            {
                title: "Cân nặng và chiều cao",
                url: "/child/weight-evaluation",
                icon: Weight
            }
        ]
    }
]