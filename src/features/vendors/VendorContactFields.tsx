import React from 'react';

interface VendorContactFieldsProps {
  contactName: string;
  setContactName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  deliverables: string;
  setDeliverables: (val: string) => void;
}

export const VendorContactFields: React.FC<VendorContactFieldsProps> = ({
  contactName,
  setContactName,
  phone,
  setPhone,
  email,
  setEmail,
  deliverables,
  setDeliverables,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="vendor-contact" className="block text-muted font-medium mb-1">
            Contact person
          </label>
          <input
            id="vendor-contact"
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="e.g. Vikramaditya Singh"
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="vendor-phone" className="block text-muted font-medium mb-1">
            Phone number
          </label>
          <input
            id="vendor-phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98200 88776"
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent tabular-nums"
          />
        </div>

        <div>
          <label htmlFor="vendor-email" className="block text-muted font-medium mb-1">
            Email address
          </label>
          <input
            id="vendor-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. vikram@marwarlighting.com"
            className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="vendor-scope" className="block text-muted font-medium mb-1">
          Deliverables / scope
        </label>
        <input
          id="vendor-scope"
          type="text"
          value={deliverables}
          onChange={(e) => setDeliverables(e.target.value)}
          placeholder="e.g. 12 Moving-head beams, warm par cans, stage truss"
          className="w-full px-3 py-2 bg-surface-raised border border-hairline rounded-md text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
    </>
  );
};
