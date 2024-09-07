import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="p-5 text-center text-sm">
        &copy; {year} {APP_NAME} | All rights reserved.
        <br />
        <span>
          Developed by{" "}
          <Link
            href="https://erfanweb.vercel.app/"
            className="hover:text-muted-foreground"
          >
            Erfan Heshmati
          </Link>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
