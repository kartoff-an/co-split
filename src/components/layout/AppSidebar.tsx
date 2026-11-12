import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import type { WorkspaceItem } from '@/types';

import { CoSplitIcon } from '@/components/CoSplitIcon';
import { ThemeToggle } from '@/components/ThemeToggle';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import {
  SquaresFourIcon,
  UsersThreeIcon,
  SignOutIcon,
  CaretDownIcon,
  ArrowsLeftRightIcon,
} from '@phosphor-icons/react';

interface AppSidebarProps {
  profile: {
    display_name: string;
    avatar_url: string | null;
  };
  workspaces: WorkspaceItem[];
  loadingWorkspaces?: boolean;
  onSignOut: () => void;
}

export function AppSidebar({ profile, workspaces, onSignOut }: AppSidebarProps) {
  const [workspacesOpen, setWorkspacesOpen] = useState(true);
  const { pathname } = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isDashboardActive = pathname === '/dashboard';
  const isSettlementsActive = pathname === '/settlements' || pathname.startsWith('/settlements/');

  const initials = profile.display_name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="p-3">
        <div className="flex h-9 items-center">
          {isCollapsed ? (
            <div className="group/logo relative flex size-9 items-center justify-center">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-150 group-hover/logo:opacity-0">
                <CoSplitIcon />
              </div>

              <SidebarTrigger className="size-9 opacity-0 transition-opacity duration-150 group-hover/logo:opacity-100" />
            </div>
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-2">
                <CoSplitIcon />
                <span className="truncate text-base font-semibold">Co-Split</span>
              </div>

              <SidebarTrigger className="ml-auto shrink-0" />
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isDashboardActive} tooltip="Dashboard" render={<Link to="/dashboard" />}>
                  <SquaresFourIcon size={20} />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isSettlementsActive}
                  tooltip="Settlements"
                  render={<Link to="/settlements" />}
                >
                  <ArrowsLeftRightIcon size={20} />
                  <span>Settlements</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Workspace dropdown */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Your workspaces"
                  onClick={() => setWorkspacesOpen((open) => !open)}
                  aria-expanded={workspacesOpen}
                >
                  <UsersThreeIcon size={20} />
                  <span>Workspaces</span>

                  <CaretDownIcon
                    className={`ml-auto transition-transform duration-200 ${workspacesOpen ? 'rotate-180' : ''}`}
                    size={16}
                  />
                </SidebarMenuButton>

                {workspacesOpen && (
                  <SidebarMenuSub>
                    {workspaces.length > 0 ? (
                      workspaces.map((workspace) => {
                        const isWorkspaceActive =
                          pathname === `/workspace/${workspace.id}` ||
                          pathname.startsWith(`/workspace/${workspace.id}/`);

                        return (
                          <SidebarMenuSubItem key={workspace.id}>
                            <SidebarMenuSubButton
                              isActive={isWorkspaceActive}
                              render={<Link to={`/workspace/${workspace.id}`} />}
                            >
                              <span className="truncate">{workspace.name}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })
                    ) : (
                      <li className="text-muted-foreground px-3 py-2 text-xs">No workspaces yet</li>
                    )}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-8 shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.display_name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-medium">{profile.display_name}</p>
            <p className="text-muted-foreground text-xs">Personal account</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col">
          <ThemeToggle />

          <Button variant="ghost" size="icon" onClick={onSignOut} title="Sign out" className="shrink-0">
            <SignOutIcon size={20} />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
