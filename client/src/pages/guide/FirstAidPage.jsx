import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  Search, Heart, Flame, Droplet, Activity, Zap, X, ChevronRight, 
  Bone, AlertTriangle, Sun, Wind, HeartPulse, Brain
} from 'lucide-react';

// --- EMERGENCY DATA (12 GUIDES) ---
const FIRST_AID_DATA = [
  {
    id: 'cpr',
    title: 'CPR (Cardiac Arrest)',
    icon: <Heart className="w-8 h-8 text-red-500" />,
    color: 'bg-red-500/10 border-red-500',
    tags: ['heart', 'breath', 'unconscious', 'chest', 'died'],
    steps: [
      "Check for breathing and responsiveness.",
      "Call Emergency (108/911) immediately.",
      "Place hands in the center of the chest.",
      "Push hard and fast (100-120 compressions/minute).",
      "Allow chest to recoil completely between pushes.",
      "Continue until help arrives."
    ],
    warning: "Only stop if the person starts breathing or help takes over."
  },
  {
    id: 'heart_attack',
    title: 'Heart Attack',
    icon: <HeartPulse className="w-8 h-8 text-rose-600" />,
    color: 'bg-rose-600/10 border-rose-600',
    tags: ['chest pain', 'tightness', 'jaw', 'arm', 'sweat'],
    steps: [
      "Call Emergency immediately.",
      "Have the person sit down and stay calm (W-position: knees bent).",
      "Loosen tight clothing.",
      "If they are not allergic, give them 300mg Aspirin to chew slowly.",
      "Monitor breathing."
    ],
    warning: "Do not let them walk around. Keep them still."
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding',
    icon: <Droplet className="w-8 h-8 text-red-700" />,
    color: 'bg-red-700/10 border-red-700',
    tags: ['cut', 'blood', 'wound', 'injury', 'stab'],
    steps: [
      "Apply direct pressure to the wound with a clean cloth.",
      "Keep pressure applied constantly.",
      "If blood soaks through, add more layers (do not remove).",
      "Elevate the injury above the heart if possible.",
      "Watch for signs of shock (pale skin, cold)."
    ],
    warning: "Do not remove the object if it's embedded in the wound."
  },
  {
    id: 'burns',
    title: 'Burns & Scalds',
    icon: <Flame className="w-8 h-8 text-orange-500" />,
    color: 'bg-orange-500/10 border-orange-500',
    tags: ['fire', 'heat', 'scald', 'skin', 'oil'],
    steps: [
      "Cool the burn under cool running water for at least 10-20 minutes.",
      "Remove tight clothing or jewelry near the burn before swelling starts.",
      "Cover with cling film or a clean, non-fluffy cloth.",
      "Keep the person warm."
    ],
    warning: "Do not apply ice, butter, or creams directly to the burn."
  },
  {
    id: 'choking',
    title: 'Choking',
    icon: <Wind className="w-8 h-8 text-blue-400" />,
    color: 'bg-blue-400/10 border-blue-400',
    tags: ['throat', 'breath', 'blocked', 'food', 'gag'],
    steps: [
      "Encourage them to cough.",
      "Give 5 sharp back blows between shoulder blades.",
      "Perform 5 abdominal thrusts (Heimlich Maneuver).",
      "Repeat cycle until blockage clears."
    ],
    warning: "Call emergency if they lose consciousness."
  },
  {
    id: 'stroke',
    title: 'Stroke (Brain Attack)',
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    color: 'bg-purple-500/10 border-purple-500',
    tags: ['face', 'arm', 'speech', 'confusion', 'fast'],
    steps: [
      "F.A.S.T Check: Face drooping?",
      "Arms: Can they raise both arms?",
      "Speech: Is their speech slurred?",
      "Time: Call emergency immediately if you see these signs.",
      "Keep them comfortable and monitor breathing."
    ],
    warning: "Do not give them food or drink (swallowing might be impaired)."
  },
  {
    id: 'seizure',
    title: 'Seizure / Epilepsy',
    icon: <Activity className="w-8 h-8 text-indigo-500" />,
    color: 'bg-indigo-500/10 border-indigo-500',
    tags: ['fit', 'shake', 'epilepsy', 'convulsion'],
    steps: [
      "Clear the area of hard or sharp objects.",
      "Place something soft under their head.",
      "Time the seizure.",
      "After it stops, roll them onto their side (Recovery Position).",
      "Stay with them until they are fully awake."
    ],
    warning: "Do NOT restrain them. Do NOT put anything in their mouth."
  },
  {
    id: 'fracture',
    title: 'Fractures (Broken Bones)',
    icon: <Bone className="w-8 h-8 text-slate-400" />,
    color: 'bg-slate-500/10 border-slate-500',
    tags: ['bone', 'break', 'leg', 'arm', 'pain'],
    steps: [
      "Stop any bleeding first.",
      "Immobilize the injured area. Do not try to realign the bone.",
      "Apply ice packs to limit swelling (wrap in cloth).",
      "Treat for shock (lay them down, keep warm)."
    ],
    warning: "Do not move the person if you suspect a spinal injury."
  },
  {
    id: 'electric',
    title: 'Electric Shock',
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    color: 'bg-yellow-400/10 border-yellow-400',
    tags: ['wire', 'current', 'zap', 'electrocution'],
    steps: [
      "Do NOT touch the person until power is off.",
      "Turn off the power source (mains switch) immediately.",
      "If you can't turn off power, push the person away using a DRY non-conductive object (wooden broom).",
      "Check breathing and start CPR if needed."
    ],
    warning: "Ensure you are standing on dry material."
  },
  {
    id: 'allergy',
    title: 'Allergic Reaction',
    icon: <AlertTriangle className="w-8 h-8 text-pink-500" />,
    color: 'bg-pink-500/10 border-pink-500',
    tags: ['anaphylaxis', 'bee', 'sting', 'peanut', 'swell'],
    steps: [
      "Call Emergency immediately if breathing is difficult.",
      "Ask if they have an auto-injector (EpiPen). Help them use it.",
      "Lay them flat with legs raised.",
      "If no improvement in 5 mins, give second dose if available."
    ],
    warning: "Do not let them stand up or walk."
  },
  {
    id: 'snake',
    title: 'Snake Bite',
    icon: <AlertTriangle className="w-8 h-8 text-emerald-500" />,
    color: 'bg-emerald-500/10 border-emerald-500',
    tags: ['snake', 'poison', 'venom', 'bite', 'cobra'],
    steps: [
      "Keep the person calm and still (movement spreads venom).",
      "Keep the bitten limb lower than the heart.",
      "Remove jewelry/tight clothing.",
      "Transport to hospital immediately."
    ],
    warning: "Do NOT suck the poison out. Do NOT apply a tourniquet."
  },
  {
    id: 'heat',
    title: 'Heat Stroke',
    icon: <Sun className="w-8 h-8 text-amber-500" />,
    color: 'bg-amber-500/10 border-amber-500',
    tags: ['sun', 'hot', 'faint', 'dehydration'],
    steps: [
      "Move to a cool, shaded place immediately.",
      "Remove excess clothing.",
      "Cool the skin with water (sponge or spray) and fan them.",
      "Apply ice packs to armpits and neck.",
      "Give small sips of water if conscious."
    ],
    warning: "Do not give aspirin or paracetamol (it does not help heat stroke)."
  }
];

export function FirstAidPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);

  // Filter Logic
  const filteredGuides = FIRST_AID_DATA.filter(guide => 
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 px-4 md:px-0">
        
        {/* HEADER */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-4">First Aid Guide</h1>
          <p className="text-slate-400 mb-8">Instant instructions for medical emergencies.</p>
          
          {/* SEARCH BAR */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            <input 
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 text-lg transition-all"
              placeholder="Describe emergency (e.g., Chest pain, Snake...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* GUIDES GRID (3 Columns Max) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <div 
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className={`p-6 rounded-2xl border ${guide.color} bg-slate-900/50 cursor-pointer hover:scale-[1.02] transition-transform group flex flex-col justify-between h-full`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-slate-800 transition-colors">
                    {guide.icon}
                  </div>
                  <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{guide.title}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                  {guide.tags.slice(0, 3).join(' • ')}
                </p>
              </div>
            </div>
          ))}

          {filteredGuides.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-slate-500 text-lg">No guides found for "{searchTerm}". Try "Pain", "Cut", or "Faint".</p>
            </div>
          )}
        </div>

        {/* MODAL (POPUP) */}
        {selectedGuide && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 shrink-0">
                <div className="flex items-center gap-4">
                  {selectedGuide.icon}
                  <h2 className="text-2xl font-bold text-white">{selectedGuide.title}</h2>
                </div>
                <button onClick={() => setSelectedGuide(null)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="p-8 overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Immediate Actions:</h3>
                
                <div className="space-y-6">
                  {selectedGuide.steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <p className="text-lg text-slate-200 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Warning Box */}
                <div className="mt-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex gap-3 items-start">
                  <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-400 font-bold mb-1">CRITICAL WARNING</h4>
                    <p className="text-red-200 text-sm">{selectedGuide.warning}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedGuide(null)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-colors w-full md:w-auto"
                >
                  Close Guide
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}