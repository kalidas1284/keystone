import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../constants/roles";
import { getErrorMessage } from "../../services/api";
import userService from "../../services/userService";
import { formatDateTime } from "../../utils/helpers";

function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setPhoneNumber(user.phoneNumber || "");
  }, [user]);

  if (!user) {
    return null;
  }

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    try {
      await userService.updateProfile({ fullName, phoneNumber: phoneNumber || undefined });
      await refreshUser();
      toast.success("Profile updated");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed");
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Failed to change password"));
    } finally {
      setSavingPassword(false);
    }
  };

  const home =
    user.role === "CUSTOMER" ? "/portal" : user.role === "TECHNICIAN" ? "/field" : "/dashboard";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Update your account details and password</p>
      </div>

      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-semibold text-slate-900">{user.fullName}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
          <Badge tone="info">{ROLE_LABELS[user.role]}</Badge>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p>
            <span className="text-slate-500">Status:</span> {user.active ? "Active" : "Inactive"}
          </p>
          <p>
            <span className="text-slate-500">Created:</span> {formatDateTime(user.createdAt)}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold text-slate-900">Edit profile</h2>
        {profileError && <ErrorMessage message={profileError} />}
        <form className="mt-3 space-y-3" onSubmit={(e) => void saveProfile(e)}>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Full name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Email</label>
            <Input value={user.email} disabled />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Phone</label>
            <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold text-slate-900">Change password</h2>
        {passwordError && <ErrorMessage message={passwordError} />}
        <form className="mt-3 space-y-3" onSubmit={(e) => void savePassword(e)}>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Current password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">New password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Confirm new password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={savingPassword}>
            {savingPassword ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Card>

      <Link to={home}>
        <Button variant="secondary">Back</Button>
      </Link>
    </div>
  );
}

export default ProfilePage;
