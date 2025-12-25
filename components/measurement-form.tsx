"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { z } from "zod";

const MeasurementSchema = z.object({
  weight: z.coerce.number().min(30).max(150).positive(),
  waist: z.coerce.number().max(200).positive(),
  neck: z.coerce.number().max(250).positive(),
  height: z.coerce.number().max(300).positive()
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
      neck: "",
      height: ""
    }
  });

  const { control, handleSubmit } = form;

  const onSubmit = (data: MeasurementData) => {
    console.log(data);
    onFormSubmit(data);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Measurement</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <FormField
                name="height"
                {...control}
                render={({ field }) => {
                  return (
                    <div className="space-y-2">
                      <Label>Height</Label>
                      <Input
                        placeholder="height"
                        type="number"
                        {...field}
                      ></Input>
                      <FormMessage></FormMessage>
                    </div>
                  );
                }}
              ></FormField>

              <FormField
                name="weight"
                {...control}
                render={({ field }) => {
                  return (
                    <div className="space-y-2">
                      <Label>Weight</Label>
                      <Input
                        placeholder="weight"
                        type="number"
                        {...field}
                      ></Input>
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
                      <Input
                        placeholder="Waist"
                        type="number"
                        {...field}
                      ></Input>
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
                      <Input
                        placeholder="Neck"
                        type="number"
                        {...field}
                      ></Input>
                      <FormMessage></FormMessage>
                    </div>
                  );
                }}
              ></FormField>

              <div className="w-full">
                <Button
                  type="submit"
                  disabled={loading}
                  variant={loading ? "outline" : "default"}
                >
                  Submit {loading ? <Spinner /> : ""}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default MeasurementForm;
