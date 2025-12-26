import * as React from "react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@community-nutrition/ui"
import Link from "next/link"
import { Command } from "lucide-react"
import { APP_CONFIG } from "../config/app-config"

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

            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}