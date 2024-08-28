import { APP_NAME } from "@/lib/constants";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="p-5 flex-center text-center text-sm">
        &copy; {year} {APP_NAME} | All Rights reserved.
        <br />
        Developed by Erfan Heshmati
      </div>
    </footer>
  );
};

export default Footer;
