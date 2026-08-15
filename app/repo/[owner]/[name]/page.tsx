export default function RepositoryDetailPage({
  params,
}: {
  params: { owner: string; name: string };
}) {
  return (
    <main className="p-8">
      Repository Detail: {params.owner}/{params.name}
    </main>
  );
}
