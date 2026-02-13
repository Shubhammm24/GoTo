import { useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDriverStore } from '../../store/driverStore';

export default function EarningsCard() {
    const { earnings, fetchEarnings, isLoading } = useDriverStore();

    useEffect(() => {
        fetchEarnings();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/2" />
                    <div className="h-24 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Today\'s Earnings',
            value: `₹${earnings?.today || 0}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            label: 'This Week',
            value: `₹${earnings?.thisWeek || 0}`,
            icon: TrendingUp,
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            label: 'This Month',
            value: `₹${earnings?.thisMonth || 0}`,
            icon: Calendar,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        {
            label: 'Total Earnings',
            value: `₹${earnings?.total || 0}`,
            icon: Wallet,
            color: 'from-orange-500 to-red-600',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600'
        }
    ];

    return (
        <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">💰 Earnings Overview</h2>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View Details →
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;

                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`${stat.bgColor} rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all`}
                        >
                            {/* Background gradient on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                            <div className="relative z-10">
                                <div className={`${stat.textColor} group-hover:text-white transition-colors mb-3`}>
                                    <Icon size={24} />
                                </div>
                                <div className={`text-sm ${stat.textColor} group-hover:text-white/80 transition-colors mb-2`}>
                                    {stat.label}
                                </div>
                                <div className={`text-2xl font-bold ${stat.textColor} group-hover:text-white transition-colors`}>
                                    {stat.value}
                                </div>
                            </div>

                            {/* Decorative circle */}
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform" />
                        </motion.div>
                    );
                })}
            </div>

            {/* Additional Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{earnings?.totalRides || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Rides</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">₹{earnings?.averagePerRide || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Avg per Ride</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">₹{earnings?.pendingPayout || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Pending Payout</div>
                </div>
            </div>
        </div>
    );
}
