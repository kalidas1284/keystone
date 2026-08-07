import Logo from "../../components/common/Logo";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-100 flex items-center justify-center p-4">

      <Card className="w-full max-w-md">

        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <h2 className="text-center text-2xl font-bold text-slate-800">
          Welcome Back
        </h2>

        <p className="text-center text-slate-500 mt-2 mb-6">
          Sign in to continue
        </p>

        <div className="space-y-5">

          <Input
            type="email"
            placeholder="Email Address"
          />

          <Input
            type="password"
            placeholder="Password"
          />

          <Button className="w-full">
            Sign In
          </Button>

        </div>

      </Card>

    </div>
  );
}

export default LoginPage;