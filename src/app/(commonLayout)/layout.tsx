import Navbar from "@/components/ui/navbar";

export default function CommonLayout({children}:{children:React.ReactNode}){
  return(
      <>
        <Navbar/>
        {children}
      </>
    );
}