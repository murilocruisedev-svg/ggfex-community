'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Music, Activity } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white font-heading">Overview</h1>
                <p className="text-gray-400">Welcome back, Admin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Subscribers</CardTitle>
                        <Users className="h-4 w-4 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-green-500">+20% from last month</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Sound Effects</CardTitle>
                        <Music className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">567</div>
                        <p className="text-xs text-gray-500">Processing 12 new files</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Active Sessions</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">89</div>
                        <p className="text-xs text-green-500">+12% currently online</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-white/10 text-white">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription className="text-gray-400">Example log of recent actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center text-sm">
                                    <div className="h-2 w-2 bg-primary rounded-full mr-2"></div>
                                    <span className="font-medium text-white">New user subscribed</span>
                                    <span className="ml-auto text-gray-500 text-xs">2 min ago</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
