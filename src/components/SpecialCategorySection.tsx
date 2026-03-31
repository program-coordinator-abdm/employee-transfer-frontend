import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import FileUploadField from "@/components/FileUploadField";
import type { UploadResult } from "@/lib/fileUpload";

export interface SpecialCategoryState {
  selected: boolean[];
  documents: string[]; // uploaded file references per category
}

export const EMPTY_SPECIAL_CATEGORIES = (): SpecialCategoryState => ({
  selected: [false, false, false, false, false, false, false],
  documents: ["", "", "", "", "", "", ""],
});

export const SPECIAL_CATEGORY_LABELS: string[] = [
  "Medical officer or staff or spouse or child declared as dependent under the KCS Medical Attendance Rules is suffering from terminal illness or serious ailments for which treatment is not available at the place of work and transfer is necessary to a place where such treatment is available",
  "Pregnant or a female medical officer or staff with a child of less than one year of age",
  "Medical officer or staff who are due to retire on superannuation within two years",
  "Medical officer/staff or spouse or child with disability of 40% or more",
  "Widow or Widower or divorcee Medical officer or staff with children less than 12 years of age",
  "Any cadre / any officers being married to an employee of a Central Government or State Government or Aided Institution",
  "Karnataka State Government Employee Association Elected Members",
];

const CATEGORY_7_QUESTION = "Are you an elected Karnataka State Government Employee Association member?";
const CATEGORY_7_DOC_HINT = "Details related to elected Karnataka State Government Employee Association membership - ಚುನಾವಣಾ ಅಧಿಕಾರಿಯ ದೃಢೀಕೃತ ಪ್ರಮಾಣಪತ್ರ — Duly certified by the Election Officer";

interface Props {
  value: SpecialCategoryState;
  onChange: (val: SpecialCategoryState) => void;
  readOnly?: boolean;
}

const SpecialCategorySection: React.FC<Props> = ({ value, onChange, readOnly }) => {
  const toggleCategory = (idx: number) => {
    const next = { ...value, selected: [...value.selected], documents: [...value.documents] };
    next.selected[idx] = !next.selected[idx];
    if (!next.selected[idx]) {
      next.documents[idx] = "";
    }
    onChange(next);
  };

  const setDocument = (idx: number, ref: string) => {
    const next = { ...value, documents: [...value.documents] };
    next.documents[idx] = ref;
    onChange(next);
  };

  const handleUploadComplete = (idx: number, result: UploadResult) => {
    setDocument(idx, result.url || result.fileName || "");
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-primary mb-4">Special Category</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Select applicable special categories. Document upload is optional for each.
      </p>
      <div className="space-y-4">
        {SPECIAL_CATEGORY_LABELS.map((label, idx) => {
          const isCategory7 = idx === 6;
          const displayLabel = isCategory7 ? CATEGORY_7_QUESTION : `${idx + 1}. ${label}`;

          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`special-cat-${idx}`}
                  checked={value.selected[idx]}
                  onCheckedChange={() => !readOnly && toggleCategory(idx)}
                  disabled={readOnly}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`special-cat-${idx}`}
                  className="text-sm text-foreground leading-snug cursor-pointer select-none"
                >
                  {displayLabel}
                </label>
              </div>

              {value.selected[idx] && (
                <div className="ml-8">
                  {readOnly ? (
                    value.documents[idx] ? (
                      <p className="text-sm text-primary underline">{value.documents[idx]}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No document uploaded</p>
                    )
                  ) : (
                    <FileUploadField
                      value={value.documents[idx]}
                      onChange={(fileName) => setDocument(idx, fileName)}
                      onUploadComplete={(result) => handleUploadComplete(idx, result)}
                      fieldName={`specialCategory${idx + 1}Doc`}
                      label={isCategory7 ? "Upload supporting document" : `Upload document for Category ${idx + 1}`}
                      hint={isCategory7 ? CATEGORY_7_DOC_HINT : "Max file size: 5 MB."}
                      required={false}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SpecialCategorySection;
