import React, { useState } from 'react';
import { type FieldMetadata } from '@conform-to/react';
import FormField from '@/components/form/form-field.tsx';
import { useFieldControl } from '@/hooks/use-field-control.ts';
import OrganizationCombobox from '@/features/organizations/components/organization-combobox.tsx';
import CountryCombobox from '@/features/countries/components/country-combobox.tsx';
import { CountrySummary } from '@/features/countries/types/country.ts';
import { OrganizationSummary } from '@/features/organizations/types/organization.ts';
import { CreateJobApplicationForm } from '@/features/job-applications/schemas/create-job-application-schema.ts';

interface Props {
  form: { id: string };
  fields: {
    organizationName: FieldMetadata<string, CreateJobApplicationForm>;
    organizationId: FieldMetadata<string | undefined, CreateJobApplicationForm>;
    countryId: FieldMetadata<string, CreateJobApplicationForm>;
  };
  // A prefilled organization, which also prefills its first country
  organization?: OrganizationSummary;
}

// Both fields can start with a value, and neither combobox renders an input named after its
// field. Their controls have to mount together with the form to get one, so they live here,
// in a component that mounts with the form, instead of in the dialog that is mounted before it.
// This also restarts the country on every reset, as the dialog remounts its fields
const OrganizationCountrySection = ({ form, fields, organization }: Props) => {
  const organizationName = useFieldControl(form, fields.organizationName);
  const countryId = useFieldControl(form, fields.countryId);
  // Kept as an object too: the combobox shows its name and flag, the form only needs the id
  const [country, setCountry] = useState<CountrySummary | null>(organization?.countries[0] ?? null);

  const handleCountryChange = (next: CountrySummary | null) => {
    setCountry(next);
    countryId.change(next?.id ?? '');
  };

  const handleOrganizationChange = (next: OrganizationSummary | string) => {
    if (typeof next === 'string') {
      organizationName.change(next);
      return;
    }
    organizationName.change(next.name);
    // Only pre-fills an empty country, never replaces one the user chose
    const [firstCountry] = next.countries;
    if (firstCountry && !country) handleCountryChange(firstCountry);
  };

  return (
    <div className={'flex gap-4'}>
      <FormField field={fields.organizationName} label="Organization" required>
        <OrganizationCombobox
          idName={fields.organizationId.name}
          defaultValue={organization}
          change={handleOrganizationChange}
          blur={organizationName.blur}
          id={fields.organizationName.id}
          invalid={!fields.organizationName.valid}
        />
      </FormField>

      <FormField field={fields.countryId} label="Country" required>
        <CountryCombobox
          value={country}
          change={handleCountryChange}
          blur={countryId.blur}
          id={fields.countryId.id}
          invalid={!fields.countryId.valid}
        />
      </FormField>
    </div>
  );
};

export default OrganizationCountrySection;
