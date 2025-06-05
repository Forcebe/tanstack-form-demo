import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useForm } from "@tanstack/react-form";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { validateUsername } from "@/api/user";
import { z } from "zod";

// zod schema can be used as a validator
const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long");

export const SignUp = () => {
  // declaring default values sets types
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      // validators can be set at the form level as well as the field level
      onSubmit: ({ value }) => {
        if (!value.username || !value.password) {
          // string error applies to the entire form
          return "Please fill in all fields";
        }
      },
    },
    onSubmit: ({ value }) => {
      // value is typed automatically
      console.log(value);
    },
  });
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Creating a form with <span className="font-bold">@DevLeonardo</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* field is a wrapper component. `name` is typed to the key of the defaultvalue object */}
          <form.Field
            name="username"
            // validators has props that determine when validation occurs
            validators={{
              // async needed for debounce
              onChangeAsyncDebounceMs: 500,
              // simulate async validation - returns invalid if username is 'foo', 'bar' or 'baz'
              onChangeAsync: ({ value }) => validateUsername(value),
              // sync validation can be used together with async validation
              // this will run before the async validation, & prevent the async validation if the sync validation is invalid
              onChange: usernameSchema, // using zod schema
            }}
            // form UI goes in the children prop of the field component
            children={(field) => (
              // field is used to control the component
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {/* getMeta() is used to access the meta data of the field. It gets computed or derived state, as opposed to just accessing field.state.meta directly*/}
                  {field.getMeta().isValidating && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <LoaderCircle className="animate-spin" />
                    </div>
                  )}
                </div>
                {/* field.state.meta.errors is an array of errors that are returned from the field  */}
                {field.state.meta.errors && (
                  <div className="text-red-500 text-sm mt-1">
                    {field.state.meta.errors.join(", ")}
                  </div>
                )}
              </div>
            )}
          />
          <form.Field
            name="password"
            validators={{
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: ({ value }) => {
                if (value.length < 6) {
                  return "Password must be at least 6 characters long";
                }

                if (!/[A-Z]/.test(value)) {
                  return "Password must contain at least one uppercase letter";
                }

                if (!/[a-z]/.test(value)) {
                  return "Password must contain at least one lowercase letter";
                }

                if (!/[0-9]/.test(value)) {
                  return "Password must contain at least one number";
                }
              },
            }}
            children={(field) => (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors && (
                  <div className="text-red-500 text-sm mt-1">
                    {field.state.meta.errors.join(", ")}
                  </div>
                )}
              </div>
            )}
          />
          <form.Field
            name="confirmPassword"
            validators={{
              // every time a field in this array changes, the onChange will be called
              // this is important to make sure that changes to both fields are validated together
              onChangeListenTo: ["password"],
              // fieldApi is used to read the password field
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue("password") &&
                "Passwords do not match",
            }}
            children={(field) => (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors && (
                  <div className="text-red-500 text-sm mt-1">
                    {field.state.meta.errors}
                  </div>
                )}
              </div>
            )}
          />
          {/* form.Subscribe is used to subscribe to the form state. 
          This means that when the form state changes, the component will re-render. */}
          <form.Subscribe
            selector={(state) => state.errors}
            children={(errors) =>
              errors.length > 0 && (
                <Alert variant={"destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errors}</AlertDescription>
                </Alert>
              )
            }
          />
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        {/* form methods can be used outside the form component. */}
        <Button onClick={form.handleSubmit}>Sign Up</Button>
      </CardFooter>
    </Card>
  );
};
