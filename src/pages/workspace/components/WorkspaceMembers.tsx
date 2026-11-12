import type { Member } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkspaceMembersProps {
  members: Member[];
}

export function WorkspaceMembers({ members }: WorkspaceMembersProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {members.map((member) => {
          const name = member.display_name || 'Member';

          return (
            <Tooltip key={member.id}>
              <TooltipTrigger render={<Avatar className="border-background h-8 w-8 border-2" />}>
                <AvatarImage src={member.avatar_url || undefined} alt={name} />
                <AvatarFallback className="text-[10px] font-medium">{name.charAt(0).toUpperCase()}</AvatarFallback>
              </TooltipTrigger>

              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
