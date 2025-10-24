import React, { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { ArrowLeft, CreditCard, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreditCards, CardDetails } from "./CreditCards";
import AddCardModal from "./AddCardModal";

const Card: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cards, setCards] = useState<CardDetails[]>([]);
  // You can replace this with actual domain detection logic
  const currentDomain = "amazon.com";

  const handleAddCard = (card: CardDetails): void => {
    setCards((prev) => [...prev, card]);
  };

  return (
    <div className="h-screen w-full bg-[var(--bg-dark)] flex flex-col">
      <Navbar />

      {/* Opaque background under navbar + title */}
      <div className="fixed top-0 left-0 right-0 h-[9.5rem] bg-[var(--bg-dark)] z-30" />

      {/* Header bar */}
      <div className="fixed top-24 left-0 right-0 z-40 px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2 hover:bg-white/10"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2">
              <CreditCard size={16} />
              My Cards
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Add Card
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pt-38 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          <CreditCards domain={currentDomain} userCards={cards} />
        </div>
      </div>

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCard={handleAddCard}
      />
    </div>
  );
};

export default Card;
