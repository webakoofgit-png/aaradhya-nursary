import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { Check, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/PageHeader";
import { registerB2b } from "@/server/b2b-actions";

export const Route = createFileRoute("/wholesale/register")({ component: RegistrationPage });

const steps = ["Personal", "Business", "Address", "Documents"];
const fieldsByStep = [
  ["fullName", "mobile", "whatsapp", "email", "password", "confirmPassword"],
  [
    "businessName",
    "businessType",
    "gstNumber",
    "panNumber",
    "yearsInBusiness",
    "expectedMonthlyPurchase",
    "productInterests",
  ],
  ["businessAddress", "city", "state", "pinCode", "deliveryAddress"],
  ["gst_certificate", "pan_document", "business_registration", "identity_proof"],
] as const;
const fieldClass =
  "mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

async function filePayload(
  file: File,
  kind: "gst_certificate" | "pan_document" | "business_registration" | "identity_proof",
) {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  return {
    kind,
    name: file.name,
    type: file.type as "application/pdf" | "image/jpeg" | "image/png",
    size: file.size,
    data,
  };
}

function RegistrationPage() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);
  const navigate = useNavigate();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentFields = (fieldsByStep[step] ?? []).filter(
      (name) => !(step === 2 && sameAddress && name === "deliveryAddress"),
    );
    for (const name of currentFields) {
      const field = event.currentTarget.elements.namedItem(name);
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement ||
        field instanceof HTMLTextAreaElement
      ) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return;
        }
      }
    }
    if (step === 0 && form.get("password") !== form.get("confirmPassword")) {
      toast.error("Password and confirm password must match.");
      return;
    }
    if (step < 3) {
      setStep((value) => value + 1);
      return;
    }
    const kinds = [
      "gst_certificate",
      "pan_document",
      "business_registration",
      "identity_proof",
    ] as const;
    try {
      setBusy(true);
      const documents = await Promise.all(
        kinds.map((kind) => {
          const file = form.get(kind);
          if (!(file instanceof File) || !file.size)
            throw new Error("Please upload all four business documents.");
          if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} exceeds the 5 MB limit.`);
          if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type))
            throw new Error("Documents must be PDF, JPG or PNG files.");
          return filePayload(file, kind);
        }),
      );
      const businessAddress = String(form.get("businessAddress"));
      await registerB2b({
        data: {
          fullName: String(form.get("fullName")),
          mobile: String(form.get("mobile")),
          whatsapp: String(form.get("whatsapp")),
          email: String(form.get("email")),
          password: String(form.get("password")),
          confirmPassword: String(form.get("confirmPassword")),
          businessName: String(form.get("businessName")),
          businessType: String(form.get("businessType")),
          gstNumber: String(form.get("gstNumber")),
          panNumber: String(form.get("panNumber")),
          yearsInBusiness: Number(form.get("yearsInBusiness")),
          expectedMonthlyPurchase: String(form.get("expectedMonthlyPurchase")),
          productInterests: String(form.get("productInterests")),
          businessAddress,
          city: String(form.get("city")),
          state: String(form.get("state")),
          pinCode: String(form.get("pinCode")),
          deliveryAddress: sameAddress ? businessAddress : String(form.get("deliveryAddress")),
          documents,
        },
      });
      toast.success("Registration submitted for verification.");
      await navigate({ to: "/wholesale/login", search: { registered: "1" } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="B2B Registration"
        subtitle="Apply for verified wholesale access."
        trail={[{ label: "Wholesale", to: "/wholesale" }, { label: "Register" }]}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Registration progress">
          {steps.map((label, index) => (
            <li key={label} className="min-w-0 text-center text-xs">
              <span
                className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${index <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                {index < step ? <Check size={16} /> : index + 1}
              </span>
              <span className="mt-2 block truncate">{label}</span>
            </li>
          ))}
        </ol>
        <form
          onSubmit={submit}
          noValidate
          className="rounded-md border border-border bg-card p-5 shadow-soft sm:p-8"
        >
          <div className={step === 0 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
            <Field name="fullName" label="Full name" required />
            <Field
              name="mobile"
              label="Mobile number"
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              required
            />
            <Field
              name="whatsapp"
              label="WhatsApp number"
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              required
            />
            <Field name="email" label="Email address" type="email" required />
            <Field name="password" label="Password" type="password" minLength={8} required />
            <Field
              name="confirmPassword"
              label="Confirm password"
              type="password"
              minLength={8}
              required
            />
          </div>
          <div className={step === 1 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
            <Field name="businessName" label="Business name" required />
            <label className="text-sm">
              Business type
              <select name="businessType" className={fieldClass} required>
                <option value="">Select type</option>
                {[
                  "Nursery",
                  "Landscaper",
                  "Retailer",
                  "Builder",
                  "Hotel / Resort",
                  "Institution",
                  "Corporate",
                  "Other",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <Field name="gstNumber" label="GST number" maxLength={15} required />
            <Field name="panNumber" label="PAN number" maxLength={10} required />
            <Field
              name="yearsInBusiness"
              label="Years in business"
              type="number"
              min={0}
              max={100}
              required
            />
            <label className="text-sm">
              Expected monthly purchase
              <select name="expectedMonthlyPurchase" className={fieldClass} required>
                <option value="">Select range</option>
                <option>Below Rs. 25,000</option>
                <option>Rs. 25,000 - Rs. 1 lakh</option>
                <option>Rs. 1 lakh - Rs. 5 lakh</option>
                <option>Above Rs. 5 lakh</option>
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              Product interests
              <textarea
                name="productInterests"
                rows={3}
                className={`${fieldClass} h-auto py-3`}
                required
              />
            </label>
          </div>
          <div className={step === 2 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
            <label className="text-sm sm:col-span-2">
              Business address
              <textarea
                name="businessAddress"
                rows={3}
                className={`${fieldClass} h-auto py-3`}
                required
              />
            </label>
            <Field name="city" label="City" required />
            <Field name="state" label="State" required />
            <Field
              name="pinCode"
              label="PIN code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              required
            />
            <label className="flex items-center gap-2 self-end pb-3 text-sm">
              <input
                type="checkbox"
                checked={sameAddress}
                onChange={(e) => setSameAddress(e.target.checked)}
              />
              Same as business address
            </label>
            {!sameAddress ? (
              <label className="text-sm sm:col-span-2">
                Delivery address
                <textarea
                  name="deliveryAddress"
                  rows={3}
                  className={`${fieldClass} h-auto py-3`}
                  required
                />
              </label>
            ) : null}
          </div>
          <div className={step === 3 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
            <UploadField name="gst_certificate" label="GST certificate" />
            <UploadField name="pan_document" label="PAN document" />
            <UploadField name="business_registration" label="Business registration" />
            <UploadField name="identity_proof" label="Shop / company identity proof" />
            <p className="text-xs text-muted-foreground sm:col-span-2">
              PDF, JPG or PNG only. Maximum 5 MB per document. Files are stored privately and are
              available only to administrators.
            </p>
          </div>
          <div className="mt-8 flex justify-between border-t border-border pt-5">
            <button
              type="button"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {step === 3 ? (busy ? "Registering..." : "Register Now") : "Continue"}
              {step < 3 ? <ChevronRight size={16} /> : null}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field(props: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="text-sm">
      {label}
      <input {...inputProps} className={fieldClass} />
    </label>
  );
}

function UploadField({ name, label }: { name: string; label: string }) {
  return (
    <label className="text-sm">
      <span className="flex items-center gap-2">
        <Upload size={15} />
        {label}
      </span>
      <input
        name={name}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="mt-2 block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-secondary-foreground"
        required
      />
    </label>
  );
}
