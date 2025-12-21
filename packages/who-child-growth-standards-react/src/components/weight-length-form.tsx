import { Button, Calendar, Field, FieldError, FieldGroup, FieldLabel, Input, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@community-nutrition/ui"
import { useForm, Controller, UseFormRegister, Control, FieldErrors } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Gender } from "who-child-growth-standards"

const weightLengthSchema = z.object({
  length: z
    .number()
    .positive("Length must be positive")
    .min(0.1, "Length must be at least 0.1 cm"),
  weight: z
    .number()
    .positive("Weight must be positive")
    .min(0.01, "Weight must be at least 0.01 kg"),
  birthdate: z.date({
    error: (issue) => {
      if (issue.code === "invalid_type") {
        return issue.input === undefined
          ? "Birthdate is required"
          : "Please select a valid date";
      }
      return "Invalid date";
    },
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
      <FieldError errors={error ? [error] : undefined} />
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
      <FieldError errors={error ? [error] : undefined} />
    </Field>
  )
}

interface BirthdateFieldProps {
  control: Control<WeightLengthFormData>
  error?: FieldErrors<WeightLengthFormData>["birthdate"]
}

const BirthdateField = ({ control, error }: BirthdateFieldProps) => {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="birthdate">Birthdate</FieldLabel>
      <Controller
        name="birthdate"
        control={control}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="birthdate"
                type="button"
                variant="outline"
                data-empty={!field.value}
                aria-invalid={!!error}
                className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      />
      <FieldError errors={error ? [error] : undefined} />
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
      <FieldError errors={error ? [error] : undefined} />
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
