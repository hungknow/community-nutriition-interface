import { Button, Field, FieldError, FieldGroup, FieldLabel, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@community-nutrition/ui"
import { useForm, Controller, UseFormRegister, Control, FieldErrors } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Gender } from "who-child-growth-standards"

const weightLengthSchema = z.object({
  length: z
    .number()
    .refine((val) => !isNaN(val) && isFinite(val), {
      message: "Length is required",
    })
    .refine((val) => val > 0, {
      message: "Length must be positive",
    })
    .refine((val) => val >= 0.1, {
      message: "Length must be at least 0.1 cm",
    }),
  weight: z
    .number()
    .refine((val) => !isNaN(val) && isFinite(val), {
      message: "Weight is required",
    })
    .refine((val) => val > 0, {
      message: "Weight must be positive",
    })
    .refine((val) => val >= 0.01, {
      message: "Weight must be at least 0.01 kg",
    }),
  birthdate: z.date({
    message: "Birthdate is required",
  }),
  gender: z.enum(Gender),
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
      <FieldLabel htmlFor="length">Length (cm)</FieldLabel>
      <Input
        id="length"
        type="number"
        step="0.1"
        aria-invalid={!!error}
        {...register("length", { valueAsNumber: true })}
      />
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
      <FieldLabel htmlFor="weight">Weight (kg)</FieldLabel>
      <Input
        id="weight"
        type="number"
        step="0.01"
        aria-invalid={!!error}
        {...register("weight", { valueAsNumber: true })}
      />
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}

interface BirthdateFieldProps {
  control: Control<WeightLengthFormData>
  error?: FieldErrors<WeightLengthFormData>["birthdate"]
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

const getYears = () => {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let year = 2000; year <= currentYear; year++) {
    years.push(year)
  }
  return years.reverse() // Most recent years first
}

const BirthdateField = ({ control, error }: BirthdateFieldProps) => {
  const years = getYears()

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="birthdate">Birthdate</FieldLabel>
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
                  className="w-[140px]"
                >
                  <SelectValue placeholder="Month" />
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
                  className="w-[100px]"
                >
                  <SelectValue placeholder="Year" />
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
      <FieldLabel htmlFor="gender">Gender</FieldLabel>
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
              <SelectValue placeholder="Select a gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Gender.Male}>Male</SelectItem>
              <SelectItem value={Gender.Female}>Female</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}

export const WeightLengthForm = ({ onSubmit }: WeightLengthFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WeightLengthFormData>({
    resolver: zodResolver(weightLengthSchema),
    mode: "all",
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
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
