// frontend/src/features/dashboard/components/RentalAlertCard.tsx


import {useState, type ReactNode} from 'react';
import {ChevronDown, ChevronUp} from 'lucide-react';

interface RentalAlertCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    count: number;
    color: 'amber' | 'red';
    children: ReactNode;
}

const colorVariants = {
    amber: {
        border: 'border-amber-200',
        hover: 'hover:bg-amber-50/50',
        icon: 'bg-amber-50 text-amber-700',
        count: 'text-amber-700',
        divider: 'border-amber-100',
    },
    red: {
        border: 'border-red-200',
        hover: 'hover:bg-red-50/50',
        icon: 'bg-red-50 text-red-700',
        count: 'text-red-700',
        divider: 'border-red-100',
    },
};

export function RentalAlertCard({
    icon,
    title,
    description,
    count,
    color,
    children,
}: RentalAlertCardProps) {
    const [isOpen, setIsOpen] = useState(true);

    const colors = colorVariants[color];

    return (
        <div className={`overflow-hidden rounded-2xl border bg-white ${colors.border}`}>
            <button
                type="button"
                onClick={() => setIsOpen(open => !open)}
                aria-expanded={isOpen}
                className={`flex w-full items-center gap-3 p-5 text-left ${colors.hover}`}
            >
                <span className={`rounded-xl p-3 ${colors.icon}`}>
                    {icon}
                </span>

                <span className="min-w-0 flex-1">
                    <span className="block font-medium text-gray-900">
                        {title}
                    </span>

                    <span className="block text-sm text-gray-500">
                        {description}
                    </span>
                </span>

                <span className={`text-2xl font-bold ${colors.count}`}>
                    {count}
                </span>

                {isOpen
                    ? <ChevronUp size={20}/>
                    : <ChevronDown size={20}/>
                }
            </button>

            {isOpen && (
                <div className={`border-t px-5 pb-4 ${colors.divider}`}>
                    {children}
                </div>
            )}
        </div>
    );
}