import * as React from "react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@community-nutrition/ui"
import Link from "next/link"
import { Command } from "lucide-react"
import { APP_CONFIG } from "../config/app-config"
import { navSidebarItems } from "../config/navigation-sidebar-items"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Link prefetch={false} href="/">
                                <Command />
                                <span className="font-semibold text-base">{APP_CONFIG.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {navSidebarItems.map((group) => (
                    <SidebarGroup key={group.id}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link prefetch={false} href={item.url} className="flex items-center gap-2">
                                            {item.icon && <item.icon className="size-4" />}
                                            <span className="text-sm">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}