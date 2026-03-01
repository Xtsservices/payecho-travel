import { Navigate, useParams } from 'react-router-dom';

export default function MotelDetailsRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/motel/${id}`} replace />;
}
