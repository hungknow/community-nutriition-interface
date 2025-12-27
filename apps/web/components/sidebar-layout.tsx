'use client'

import { SidebarInset, SidebarProvider } from "@community-nutrition/ui"
import * as React from "react"
import { AppSidebar } from "./app-sidebar"

export const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex flex-col gap-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}