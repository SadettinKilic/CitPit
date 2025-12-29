import { Modal } from '../ui/Modal';

// ... (clean up imports, remove clutter)

export function InvestmentAdvisor({ balance }: InvestmentAdvisorProps) {
    const [advice, setAdvice] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

    const getAdvice = async (forceRefresh = false) => {
        if (!isModalOpen && !forceRefresh) {
            // First open, just show modal if we have cached advice
            const cached = sessionStorage.getItem('finflow_advice');
            if (cached) {
                setAdvice(cached);
                setIsModalOpen(true);
                return;
            }
        }

        if (balance <= 0) {
            setAdvice('Yatırım tavsiyesi almak için önce bakiyenizi artırmalısınız.');
            setIsModalOpen(true);
            return;
        }

        setIsModalOpen(true); // Open immediately to show loading state
        setLoading(true);
        setError('');

        try {
            // Get goal data
            const savedGoal = localStorage.getItem('finflow_goal');
            const goal = savedGoal ? JSON.parse(savedGoal) : null;

            // Get current market prices
            const prices = await getPrices();

            const response = await fetch('/api/advice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    balance,
                    goal,
                    prices,
                    date: new Date().toLocaleDateString('tr-TR'),
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAdvice(data.advice);
                sessionStorage.setItem('finflow_advice', data.advice);
            } else {
                setError(data.error || 'Tavsiye alınamadı. API anahtarı eksik olabilir.');
            }
        } catch (err) {
            setError('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Sidebar Trigger Card */}
            <Card
                className="mt-6 bg-gradient-to-br from-[#0F1115] to-[#1a1a1a] border-[#F7931A]/20 cursor-pointer hover:border-[#F7931A]/50 transition-colors group"
                onClick={() => getAdvice(false)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F7931A]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles size={20} className="text-[#F7931A]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-heading font-bold text-white">Yatırım Asistanı</h3>
                        <p className="text-xs text-[#94A3B8] group-hover:text-white transition-colors">
                            Tavsiye almak için tıkla
                        </p>
                    </div>
                </div>
            </Card>

            {/* Detailed Advice Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Yapay Zeka Yatırım Tavsiyesi"
            >
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full border-2 border-[#F7931A]/20 border-t-[#F7931A] animate-spin"></div>
                                <Sparkles size={20} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#F7931A]" />
                            </div>
                            <p className="text-sm text-[#94A3B8] animate-pulse">Piyasalar analiz ediliyor...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                            {error}
                        </div>
                    ) : (
                        <div className="bg-[#030304] rounded-lg p-4 border border-gray-800">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <p className="leading-relaxed whitespace-pre-line text-gray-300">
                                    {advice}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Kapat
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                getAdvice(true);
                            }}
                            disabled={loading}
                        >
                            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Yeniden Analiz Et
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
