export type PlanLimit = {
  planId: string;
  planName: string;
  meetingLimit: number;
  minuteLimit: number;
  aiLimit: number;
};

export type UserSubscription = {
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  plan: PlanLimit | null;
  usage: {
    meetingsUsed: number;
    minutesUsed: number;
    aiInteractionsUsed: number;
  };
};

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const res = await fetch(`${process.env.BETTER_AUTH_URL}/api/subscription/status`, {
      headers: {
        'x-user-id': userId,
      },
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    
    if (!data.subscription || (data.subscription.status === 'inactive' && !data.plan)) {
      return null;
    }
    
    return {
      status: data.subscription.status,
      plan: data.plan ? {
        planId: data.plan.id,
        planName: data.plan.name,
        meetingLimit: data.plan.meetingLimit ? parseInt(data.plan.meetingLimit) : -1,
        minuteLimit: data.plan.minuteLimit ? parseInt(data.plan.minuteLimit) : -1,
        aiLimit: data.plan.aiLimit ? parseInt(data.plan.aiLimit) : -1,
      } : null,
      usage: data.usage || { meetingsUsed: 0, minutesUsed: 0, aiInteractionsUsed: 0 },
    };
  } catch {
    return null;
  }
}

export async function checkAccess(userId: string, action: 'meeting' | 'minute' | 'ai'): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const res = await fetch(`${process.env.BETTER_AUTH_URL}/api/usage/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, action }),
    });
    
    const data = await res.json();
    return { allowed: data.allowed, reason: data.reason };
  } catch {
    return { allowed: false, reason: 'Failed to check access' };
  }
}

export function canAccessFeature(userId: string, feature: string): boolean {
  return true;
}