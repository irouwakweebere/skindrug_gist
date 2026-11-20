import Link from "next/link";

export default function VendorSetupNotice() {
  return (
    <section className="vendor-message">
      <p className="vendor-eyebrow">VENDOR PORTAL</p>
      <h1>Vendor access isn’t enabled yet.</h1>
      <p>This portal needs its Supabase project configuration and marketplace database migration before vendors can apply or sign in. Applications will require email verification and team approval once setup is complete.</p>
      <Link className="vendor-button" href="/">Back to Skindrug Gist</Link>
    </section>
  );
}
