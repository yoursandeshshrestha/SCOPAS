import React, { useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { CreditCard, Building, Calendar, User } from "lucide-react";
import { CardDetails } from "./CreditCards";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (card: CardDetails) => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onAddCard,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    last4: "",
    expiryDate: "",
    cardholderName: "",
    cardType: "Visa",
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onAddCard(formData);
    setFormData({
      name: "",
      bank: "",
      last4: "",
      expiryDate: "",
      cardholderName: "",
      cardType: "Visa",
    });
    onClose();
  };

  const handleChange = (field: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Card Name"
          placeholder="e.g., HDFC Credit Card"
          icon={CreditCard}
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />

        <Input
          label="Bank Name"
          placeholder="e.g., HDFC Bank"
          icon={Building}
          value={formData.bank}
          onChange={(e) => handleChange("bank", e.target.value)}
          required
        />

        <Input
          label="Last 4 Digits"
          placeholder="1234"
          type="text"
          maxLength={4}
          value={formData.last4}
          onChange={(e) =>
            handleChange("last4", e.target.value.replace(/\D/g, ""))
          }
          required
        />

        <Input
          label="Expiry Date"
          placeholder="MM/YY"
          icon={Calendar}
          type="text"
          maxLength={5}
          value={formData.expiryDate}
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length >= 2) {
              value = value.slice(0, 2) + "/" + value.slice(2, 4);
            }
            handleChange("expiryDate", value);
          }}
          required
        />

        <Input
          label="Cardholder Name"
          placeholder="JOHN DOE"
          icon={User}
          value={formData.cardholderName}
          onChange={(e) =>
            handleChange("cardholderName", e.target.value.toUpperCase())
          }
          required
        />

        <div>
          <label className="block text-gray-400 text-xs mb-1.5 ml-1">
            Card Type
          </label>
          <select
            value={formData.cardType}
            onChange={(e) => handleChange("cardType", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] text-white border border-gray-700 focus:outline-none focus:border-gray-500 transition-colors text-sm"
            required
          >
            <option value="Visa">Visa</option>
            <option value="Mastercard">Mastercard</option>
            <option value="Amex">American Express</option>
            <option value="Rupay">RuPay</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Add Card
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCardModal;
