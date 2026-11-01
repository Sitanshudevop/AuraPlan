import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { useState } from 'react';
import { VendorContactFields } from '../features/vendors/VendorContactFields';
import { BudgetItemFinancialFields } from '../features/budget/BudgetItemFinancialFields';
import { EventBasicInfoFields } from '../components/modals/EventBasicInfoFields';
import { EventLogisticsFields } from '../components/modals/EventLogisticsFields';
import { BudgetCategory } from '../types/budget';

describe('Modal Field Inputs Behavior', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  describe('VendorContactFields: Input Handlers', () => {
    function Wrapper() {
      const [contactName, setContactName] = useState('');
      const [phone, setPhone] = useState('');
      const [email, setEmail] = useState('');
      const [deliverables, setDeliverables] = useState('');

      return (
        <VendorContactFields
          contactName={contactName}
          setContactName={setContactName}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          deliverables={deliverables}
          setDeliverables={setDeliverables}
        />
      );
    }

    it('updates contactName, phone, email, and deliverables on input change', () => {
      render(<Wrapper />);

      const contactInput = screen.getByLabelText(/Contact person/i);
      fireEvent.change(contactInput, { target: { value: 'Deepak Verma' } });
      expect(contactInput).toHaveValue('Deepak Verma');

      const phoneInput = screen.getByLabelText(/Phone number/i);
      fireEvent.change(phoneInput, { target: { value: '+91 99999 88888' } });
      expect(phoneInput).toHaveValue('+91 99999 88888');

      const emailInput = screen.getByLabelText(/Email address/i);
      fireEvent.change(emailInput, { target: { value: 'deepak@test.com' } });
      expect(emailInput).toHaveValue('deepak@test.com');

      const delivInput = screen.getByLabelText(/Deliverables/i);
      fireEvent.change(delivInput, { target: { value: 'Sound setup, 4 mics' } });
      expect(delivInput).toHaveValue('Sound setup, 4 mics');
    });
  });

  describe('BudgetItemFinancialFields: Input Handlers', () => {
    function Wrapper() {
      const [category, setCategory] = useState<BudgetCategory>('venue');
      const [allocated, setAllocated] = useState(100000);
      const [vendorQuote, setVendorQuote] = useState(120000);
      const [actualContracted, setActualContracted] = useState(110000);
      const [amountPaid, setAmountPaid] = useState(50000);

      return (
        <BudgetItemFinancialFields
          category={category}
          onCategoryChange={setCategory}
          categoryOptions={[
            { value: 'venue', label: 'Venue' },
            { value: 'catering', label: 'Catering' },
          ]}
          allocated={allocated}
          onAllocatedChange={setAllocated}
          vendorQuote={vendorQuote}
          onVendorQuoteChange={setVendorQuote}
          actualContracted={actualContracted}
          onActualContractedChange={setActualContracted}
          amountPaid={amountPaid}
          onAmountPaidChange={setAmountPaid}
          currency="INR"
        />
      );
    }

    it('updates financial numbers on input changes', () => {
      render(<Wrapper />);

      const allocInput = screen.getByLabelText(/Target allocation/i);
      fireEvent.change(allocInput, { target: { value: '150000' } });
      expect(allocInput).toHaveValue(150000);

      const quoteInput = screen.getByLabelText(/Vendor quote/i);
      fireEvent.change(quoteInput, { target: { value: '140000' } });
      expect(quoteInput).toHaveValue(140000);

      const contractedInput = screen.getByLabelText(/Contracted cost/i);
      fireEvent.change(contractedInput, { target: { value: '135000' } });
      expect(contractedInput).toHaveValue(135000);

      const paidInput = screen.getByLabelText(/Amount paid/i);
      fireEvent.change(paidInput, { target: { value: '70000' } });
      expect(paidInput).toHaveValue(70000);
    });
  });

  describe('EventBasicInfoFields & EventLogisticsFields', () => {
    it('exercises EventBasicInfoFields inputs', () => {
      const setName = vi.fn();
      const setType = vi.fn();
      const setSetting = vi.fn();
      const setCulturalPreferences = vi.fn();

      render(
        <EventBasicInfoFields
          name="Gala"
          setName={setName}
          type="wedding"
          setType={setType}
          setting="indoor"
          setSetting={setSetting}
          culturalPreferences="Traditional"
          setCulturalPreferences={setCulturalPreferences}
          hasError={false}
        />
      );

      fireEvent.change(screen.getByLabelText(/Event name/i), { target: { value: 'Grand Gala' } });
      expect(setName).toHaveBeenCalledWith('Grand Gala');

      fireEvent.change(screen.getByLabelText(/Styling & dietary notes/i), { target: { value: 'Modern' } });
      expect(setCulturalPreferences).toHaveBeenCalledWith('Modern');
    });

    it('exercises EventLogisticsFields inputs', () => {
      const setDate = vi.fn();
      const setCity = vi.fn();
      const setGuestCount = vi.fn();
      const setTargetBudget = vi.fn();

      render(
        <EventLogisticsFields
          date="2026-12-01"
          setDate={setDate}
          city="Mumbai"
          setCity={setCity}
          guestCount={100}
          setGuestCount={setGuestCount}
          targetBudget={500000}
          setTargetBudget={setTargetBudget}
          currency="INR"
          hasError={false}
        />
      );

      fireEvent.change(screen.getByLabelText(/Event date/i), { target: { value: '2026-12-15' } });
      expect(setDate).toHaveBeenCalledWith('2026-12-15');

      fireEvent.change(screen.getByLabelText(/City \/ destination/i), { target: { value: 'Pune' } });
      expect(setCity).toHaveBeenCalledWith('Pune');

      fireEvent.change(screen.getByLabelText(/Guest count/i), { target: { value: '150' } });
      expect(setGuestCount).toHaveBeenCalledWith(150);

      fireEvent.change(screen.getByLabelText(/Target budget/i), { target: { value: '600000' } });
      expect(setTargetBudget).toHaveBeenCalledWith(600000);
    });
  });
});

