"use client";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const MeasurementSchema = z.object({
  weight: z.coerce.number().min(30).max(150).positive(),
  waist: z.coerce.number().max(200).positive(),
  neck: z.coerce.number().max(250).positive()
});

export type MeasurementData = z.infer<typeof MeasurementSchema>;

interface MeasurementFormProps {
  onFormSubmit: (data: MeasurementData) => void;
  loading: boolean;
}

const MeasurementForm = ({ onFormSubmit, loading }: MeasurementFormProps) => {
  const form = useForm({
    resolver: zodResolver(MeasurementSchema),
    defaultValues: {
      weight: "",
      waist: "",
      neck: ""
    }
  });

  const { control, handleSubmit } = form;

  const onSubmit = (data: MeasurementData) => {
    onFormSubmit(data);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <FormField
            name="weight"
            {...control}
            render={({ field }) => {
              return (
                <div className="space-y-2">
                  <Label>Weight</Label>
                  <Input placeholder="weight" type="number" {...field}></Input>
                  <FormMessage></FormMessage>
                </div>
              );
            }}
          ></FormField>

          <FormField
            name="waist"
            {...control}
            render={({ field }) => {
              return (
                <div className="space-y-2">
                  <Label>Waist</Label>
                  <Input placeholder="Waist" type="number" {...field}></Input>
                  <FormMessage></FormMessage>
                </div>
              );
            }}
          ></FormField>

          <FormField
            name="neck"
            {...control}
            render={({ field }) => {
              return (
                <div className="space-y-2">
                  <Label>Neck</Label>
                  <Input placeholder="Neck" type="number" {...field}></Input>
                  <FormMessage></FormMessage>
                </div>
              );
            }}
          ></FormField>

          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={loading}
              variant={loading ? "outline" : "default"}
              className="w-full md:w-auto"
            >
              Submit {loading ? <Spinner /> : ""}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default MeasurementForm;
