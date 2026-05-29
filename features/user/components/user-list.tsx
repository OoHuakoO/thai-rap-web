'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Loading } from '@/components/shared/loading';
import { useUsers } from '../hooks/use-users';

export function UserList() {
  const { data: users, isLoading, isError, error } = useUsers();

  if (isLoading) return <Loading className="py-8" />;

  if (isError) {
    return (
      <p className="py-8 text-center text-destructive">
        {error instanceof Error ? error.message : 'Failed to load users'}
      </p>
    );
  }

  if (!users?.length) {
    return <p className="py-8 text-center text-muted-foreground">No users found.</p>;
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="pt-4">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="mt-1 inline-block rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {user.role}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
