"use client";

import { updateInvoiceTemplateAction } from "@/actions/invoice/update-invoice-template-action";
import { Editor } from "@/components/invoice/editor";
import { useInvoiceParams } from "@/hooks/use-invoice-params";
import type { JSONContent } from "@tiptap/react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { SelectCustomer } from "../select-customer";
import { LabelInput } from "./label-input";
import { transformCustomerToContent } from "./utils";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address_line_1?: string;
  address_line_2?: string;
  token: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  vat?: string;
}

interface CustomerDetailsProps {
  customers: Customer[];
}

export function CustomerDetails({ customers }: CustomerDetailsProps) {
  const { control, setValue, watch } = useFormContext();
  const { setParams } = useInvoiceParams();
  const updateInvoiceTemplate = useAction(updateInvoiceTemplateAction);

  const selectedCustomerId = watch("customer_id");
  const content = watch("customer_details");

  const foundCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  );

  useEffect(() => {
    if (foundCustomer) {
      const initialContent = transformCustomerToContent(foundCustomer);
      setValue("customer_details", initialContent, { shouldValidate: true });
    }
  }, [foundCustomer, setValue]);

  const handleLabelSave = (value: string) => {
    updateInvoiceTemplate.execute({ customer_label: value });
  };

  const handleOnChange = (content?: JSONContent | null) => {
    // Reset the selected customer id when the content is changed
    setParams({ selectedCustomerId: null });

    if (!content) {
      // Reset the selected customer id when the content is empty
      setValue("customer_id", null, { shouldValidate: true });
    }

    setValue("customer_details", content, { shouldValidate: true });
  };

  return (
    <div>
      <LabelInput
        name="template.customer_label"
        className="mb-2 block"
        onSave={handleLabelSave}
      />
      {content ? (
        <Controller
          name="customer_details"
          control={control}
          render={({ field }) => (
            <Editor
              initialContent={field.value}
              onChange={handleOnChange}
              className="h-[115px]"
            />
          )}
        />
      ) : (
        <SelectCustomer data={customers} />
      )}
    </div>
  );
}
