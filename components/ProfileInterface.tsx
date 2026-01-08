import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { User, Flag, ArrowLeft, Camera, Check, Crown } from 'lucide-react';

interface ProfileInterfaceProps {
    onNavigate: (view: string) => void;
}

const COUNTRIES = [
    { code: '🇺🇸', name: 'United States' },
    { code: '🇬🇧', name: 'United Kingdom' },
    { code: '🇨🇦', name: 'Canada' },
    { code: '🇦🇺', name: 'Australia' },
    { code: '🇩🇪', name: 'Germany' },
    { code: '🇫🇷', name: 'France' },
    { code: '🇮🇳', name: 'India' },
    { code: '🇧🇷', name: 'Brazil' },
    { code: '🇷🇺', name: 'Russia' },
    { code: '🇨🇳', name: 'China' },
    { code: '🇯🇵', name: 'Japan' },
    { code: '🇪🇸', name: 'Spain' },
    { code: '🇮🇹', name: 'Italy' },
    { code: '🇳🇱', name: 'Netherlands' },
    { code: '🇸🇪', name: 'Sweden' },
    { code: '🇳🇴', name: 'Norway' },
    { code: '🇺🇦', name: 'Ukraine' },
    { code: '🇵🇱', name: 'Poland' }
];

const ProfileInterface: React.FC<ProfileInterfaceProps> = ({ onNavigate }) => {
    const { user, updateUser } = useUser();

    // Local state for editing
    const [name, setName] = useState(user.username);
    const [country, setCountry] = useState(user.country);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        updateUser({ username: name, country });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleAvatarChange = () => {
        // Just randomizing for now or prompt
        const seed = Math.floor(Math.random() * 10000);
        updateUser({ avatar: `https://picsum.photos/seed/${seed}/200` });
    };

    return (
        <div className="flex flex-col h-full bg-[#312e2b] text-[#c3c3c3] overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full p-6 md:p-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="bg-[#262421] p-2 rounded-full hover:bg-[#383531] transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left: Avatar & Status */}
                    <div className="flex flex-col items-center">
                        <div className="w-48 h-48 rounded-lg bg-[#262421] border-4 border-[#262421] shadow-2xl overflow-hidden relative group mb-6">
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarChange}>
                                <Camera className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <button
                            onClick={handleAvatarChange}
                            className="text-sm font-semibold text-gray-400 hover:text-white mb-6"
                        >
                            Change Avatar
                        </button>

                        <div className="w-full bg-[#262421] rounded-lg p-6 border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-400 font-semibold">Membership</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${user.isPremium ? 'bg-yellow-600/20 text-yellow-500' : 'bg-gray-600/20 text-gray-400'}`}>
                                    {user.isPremium ? 'Diamond' : 'Free'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-semibold">Rating</span>
                                <span className="text-white font-bold">{user.rating}</span>
                            </div>

                            {!user.isPremium && (
                                <button className="w-full mt-6 bg-[#d1a528] hover:bg-[#eac14d] text-[#422d01] font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors">
                                    <Crown className="w-4 h-4 fill-current" />
                                    Try Premium
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Edit Form */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-[#262421] rounded-lg p-8 border border-white/5">

                            {/* Username */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#312e2b] text-white pl-10 pr-4 py-3 rounded border border-white/10 focus:border-chess-green focus:outline-none transition-colors font-semibold"
                                        placeholder="Enter username"
                                    />
                                </div>
                            </div>

                            {/* Country */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Country</label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {COUNTRIES.map((c) => (
                                        <button
                                            key={c.code}
                                            onClick={() => setCountry(c.code)}
                                            className={`p-2 rounded text-2xl flex items-center justify-center border transition-all hover:bg-[#312e2b]
                                                ${country === c.code ? 'bg-[#312e2b] border-chess-green' : 'border-transparent'}`}
                                            title={c.name}
                                        >
                                            {c.code}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSave}
                                    className={`px-8 py-3 rounded font-bold text-white transition-all transform active:scale-95 flex items-center gap-2
                                        ${isSaved ? 'bg-chess-green cursor-default' : 'bg-chess-green hover:bg-chess-greenHover shadow-[0_4px_0_0_#457524] active:shadow-none active:translate-y-[4px]'}`}
                                >
                                    {isSaved ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Saved!
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfileInterface;
