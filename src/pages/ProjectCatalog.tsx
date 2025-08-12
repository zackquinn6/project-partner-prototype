import { useSearchParams } from "react-router-dom";
import ProjectCatalog from "@/components/ProjectCatalog";

const ProjectCatalogPage = () => {
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get('mode') === 'admin';
  
  return <ProjectCatalog isAdminMode={isAdminMode} />;
};

export default ProjectCatalogPage;