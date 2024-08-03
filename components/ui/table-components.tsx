import React from "react"

export const Table: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="border-select !my-0 min-w-full border-collapse border !p-0 text-sm">
      {children}
    </table>
  </div>
)

export const Th: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <th className="bg-secondary border-select border px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
    {children}
  </th>
)

export const Td: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <td className="border-select whitespace-nowrap border px-3 py-2">
    {children}
  </td>
)
