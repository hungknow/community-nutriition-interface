import { Button, Calendar, Field, FieldDescription, FieldError, FieldGroup, FieldLabel, Input, Label, Popover, PopoverContent, PopoverTrigger, RadioGroup, RadioGroupItem, convertI18nLanguageToDateFnsLocale} from "@community-nutrition/ui"
import { useForm, Controller, UseFormRegister, Control, FieldErrors } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Gender } from "who-child-growth-standards"
import { useTranslation } from "react-i18next"
import { t } from "@/i18n/i18n-functions"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

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
  dateOfBirth: z.date({
    message: t("Date of birth is required"),
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

interface DateOfBirthFieldProps {
  control: Control<WeightLengthFormData>
  error?: FieldErrors<WeightLengthFormData>["dateOfBirth"]
}

const DateOfBirthField = ({ control, error }: DateOfBirthFieldProps) => {
  const [open, setOpen] = React.useState(false)
  const { i18n } = useTranslation()

  // Get the current locale from i18n, fallback to enUS if not found
  const calendarLocale = convertI18nLanguageToDateFnsLocale(i18n.language)

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="dateOfBirth">{t("dateOfBirth")}</FieldLabel>
      <Controller
        name="dateOfBirth"
        control={control}
        render={({ field }) => {
          const currentDate = new Date()
          const maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
          const minDate = new Date(currentDate.getFullYear() - 5, 0, 1) // Only accept children 5 years old or less

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="dateOfBirth"
                  aria-invalid={!!error}
                  className="w-full justify-between font-normal"
                >
                  {field.value ? field.value.toLocaleDateString(i18n.language) : t("selectDate")}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  required={true}
                  selected={field.value}
                  captionLayout="dropdown"
                  locale={calendarLocale}
                  disabled={(date: Date) => {
                    return date > maxDate || date < minDate
                  }}
                  onSelect={(date: Date) => {
                    field.onChange(date)
                    setOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
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
      <FieldLabel>{t("gender")}</FieldLabel>
      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="flex flex-row gap-4"
            aria-invalid={!!error}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value={Gender.Male} id="gender-male" />
              <Label htmlFor="gender-male" className="cursor-pointer">
                {t("male")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={Gender.Female} id="gender-female" />
              <Label htmlFor="gender-female" className="cursor-pointer">
                {t("female")}
              </Label>
            </div>
          </RadioGroup>
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
        <DateOfBirthField control={control} error={errors.dateOfBirth} />
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
