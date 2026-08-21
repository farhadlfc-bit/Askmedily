import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const drugName = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    title: `${drugName} — Plain English Information | AskMedily`,
    description: `What is ${drugName}? Side effects, dosage, warnings and interactions explained in plain English. NHS sourced information.`,
    openGraph: {
      title: `${drugName} | AskMedily`,
      description: `Plain English guide to ${drugName} — side effects, dosage and warnings.`,
    }
  };
}

export default async function DrugSlugPage({ params }: Props) {
  const { slug } = await params;
  const drugName = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  redirect(`/drug?q=${encodeURIComponent(drugName)}`);
}
