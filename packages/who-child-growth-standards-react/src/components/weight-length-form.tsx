import { Button, Field, FieldDescription, FieldError, FieldGroup, FieldLabel, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@community-nutrition/ui"
import { useForm, Controller, UseFormRegister, Control, FieldErrors, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Gender } from "who-child-growth-standards"
import { useTranslation } from "react-i18next"
import { t } from "@/i18n/i18n-functions"

const weightLengthSchema = z.object({
  length: z
    .union([z.number(), z.nan()])
    .refine((val) => !isNaN(val) && isFinite(val), {
      message: t("Length is required"),
    })
    .refine((val) => val >= 30, {
      message: t("Length must be at least 30 cm"),
    })
    .refine((val) => val <= 120, {
      message: t("Length must be at most 120 cm"),
    }),
  weight: z
    .union([z.number(), z.nan()])
    .refine((val) => !isNaN(val) && isFinite(val), {
      message: t("Weight is required"),
    })
    .refine((val) => val >= 1, {
      message: t("Weight must be at least 1 kg"),
    })
    .refine((val) => val <= 26, {
      message: t("Weight must be at most 26 kg"),
    }),
  birthdate: z.date({
    message: t("Birthdate is required"),
  }),
  gender: z.enum([Gender.Male, Gender.Female]),
})

export type WeightLengthFormData = z.infer<typeof weightLengthSchema>

export interface WeightLengthFormProps {
  onSubmit: (data: WeightLengthFormData) => void | Promise<void>
}

interface LengthFieldProps {
  register: UseFormRegister<WeightLengthFormData>
  error?: FieldErrors<WeightLengthFormData>["length"]
}

const LengthField = ({ register, error }: LengthFieldProps) => {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="length">{t("length(cm)")}</FieldLabel>
      <Input
        id="length"
        type="number"
        step="0.1"
        min={30}
        max={120}
        aria-invalid={!!error}
        {...register("length", { valueAsNumber: true })}
      />
      <FieldDescription>
        {t("The recommended length for a child is between 65 cm and 120 cm.")}
      </FieldDescription>
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}

interface WeightFieldProps {
  register: UseFormRegister<WeightLengthFormData>
  error?: FieldErrors<WeightLengthFormData>["weight"]
}

const WeightField = ({ register, error }: WeightFieldProps) => {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="weight">{t("weight(kg)")}</FieldLabel>
      <Input
        id="weight"
        type="number"
        step="0.1"
        min={1}
        aria-invalid={!!error}
        {...register("weight", { valueAsNumber: true })}
      />
      <FieldDescription>
        {t("The recommended weight for a child is between 1 kg and 26 kg.")}
      </FieldDescription>
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}

interface BirthdateFieldProps {
  control: Control<WeightLengthFormData>
  error?: FieldErrors<WeightLengthFormData>["birthdate"]
}

const MONTHS = [
  t("january"),
  t("february"),
  t("march"),
  t("april"),
  t("may"),
  t("june"),
  t("july"),
  t("august"),
  t("september"),
  t("october"),
  t("november"),
  t("december"),
] as const

const getYears = () => {
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - 4 // Only accept children 5 years old or less
  const years: number[] = []
  for (let year = minYear; year <= currentYear; year++) {
    years.push(year)
  }
  return years.reverse() // Most recent years first
}

const BirthdateField = ({ control, error }: BirthdateFieldProps) => {
  const years = getYears()

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="birthdate">{t("birthdate")}</FieldLabel>
      <Controller
        name="birthdate"
        control={control}
        render={({ field }) => {
          const currentMonth = field.value ? field.value.getMonth() : null
          const currentYear = field.value ? field.value.getFullYear() : null

          const handleMonthChange = (monthIndex: string) => {
            const month = parseInt(monthIndex, 10)
            const year = currentYear || new Date().getFullYear()
            const newDate = new Date(year, month, 1)
            field.onChange(newDate)
          }

          const handleYearChange = (yearStr: string) => {
            const year = parseInt(yearStr, 10)
            const month = currentMonth !== null ? currentMonth : 0
            const newDate = new Date(year, month, 1)
            field.onChange(newDate)
          }

          return (
            <div className="flex gap-2">
              <Select
                value={currentMonth !== null ? currentMonth.toString() : ""}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger
                  id="birthdate-month"
                  aria-invalid={!!error}
                  className="flex-1"
                >
                  <SelectValue placeholder={t("month")} />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={currentYear !== null ? currentYear.toString() : ""}
                onValueChange={handleYearChange}
              >
                <SelectTrigger
                  id="birthdate-year"
                  aria-invalid={!!error}
                  className="flex-1"
                >
                  <SelectValue placeholder={t("year")} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }}
      />
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}

interface GenderFieldProps {
  control: Control<WeightLengthFormData>
  error?: FieldErrors<WeightLengthFormData>["gender"]
}

const GenderField = ({ control, error }: GenderFieldProps) => {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="gender">{t("gender")}</FieldLabel>
      <Controller
        name="gender"
        control={control}
        defaultValue={Gender.Male}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger id="gender" aria-invalid={!!error}>
              <SelectValue placeholder={t("selectAGender")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Gender.Male}>{t("male")}</SelectItem>
              <SelectItem value={Gender.Female}>{t("female")}</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}

export const WeightLengthForm = ({ onSubmit }: WeightLengthFormProps) => {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WeightLengthFormData>({
    resolver: zodResolver(weightLengthSchema),
    // resolver: yupResolver(weightLengthSchemaYup),
    mode: "onSubmit",
    defaultValues: {
      gender: Gender.Male,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>

        <LengthField register={register} error={errors.length} />
        <WeightField register={register} error={errors.weight} />
        <BirthdateField control={control} error={errors.birthdate} />
        <GenderField control={control} error={errors.gender} />

        <Field orientation="horizontal">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
