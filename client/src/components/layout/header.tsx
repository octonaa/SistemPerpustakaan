import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.firstName || "Admin"}
          </span>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || ""} />
            <AvatarFallback className="bg-library-blue text-white text-sm font-medium">
              {user?.firstName ? user.firstName[0].toUpperCase() : "A"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
