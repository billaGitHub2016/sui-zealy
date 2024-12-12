
export default function AddressLink({ address, type }: { address: string | null, type: 'object' | 'account' | 'tx'}) {
  return (
    <a
      href={`${process.env.NEXT_PUBLIC_SUI_SCANNER_URL}/${type}/${address}`}
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: 'underline', color: 'inherit' }}
    >
      {address && (address.slice(0, 6) + '...' + address.slice(-4))}
    </a>
  );
}