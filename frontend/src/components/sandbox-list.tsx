import React from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { TrashIcon, RefreshIcon } from '@heroicons/react/solid'

import { GetSandboxes, GetSandboxes_listSandboxes_sandboxes } from './__generated__/GetSandboxes'
import { cache } from '../api'
import { convertDate } from '../utils'

const GET_SANDBOXES = gql`
  query GetSandboxes {
    listSandboxes(Email: "") {
      sandboxes {
        account_id
        account_name
        assigned_until
        assigned_since
        assigned_to
      }
    }
  }
`

function DeallocateSandboxButton({
  account_id,
  updateCache,
}: {
  account_id?: string
  updateCache: (key: string) => void
}) {
  const [deallocateSandbox, { data, loading }] = useMutation(gql`
    mutation DeallocateSandbox($Account_id: String!) {
      deallocateSandbox(Account_id: $Account_id) {
        message
      }
    }
  `)

  const handler = (e: React.MouseEvent<HTMLButtonElement>) => {
    const feature = false
    window.alert('zurückgeben ist noch nicht möglich!')
    if (feature) {
      const confirmation = window.confirm('Sandbox wirklich zurückgeben?')
      if (!confirmation) return
      const value = e.currentTarget.value
      deallocateSandbox({
        variables: {
          Account_id: e.currentTarget.value,
        },
      })
        .then(() => {
          updateCache(value)
        })
        .catch(console.error)
    }
  }

  return (
    <button
      value={account_id}
      onClick={handler}
      className="shadow bg-gray-300 hover:bg-gray-200 text-grey-darkest font-bold py-2 px-4 rounded inline-flex items-center "
    >
      {data === undefined && !loading ? (
        <TrashIcon className="h-5 w-5 text-red-600" />
      ) : (
        <RefreshIcon className="h-5 w-5 animate-spin" />
      )}
    </button>
  )
}

function SandboxList() {
  const { loading, error, data } = useQuery<GetSandboxes>(GET_SANDBOXES)

  const updateCache = (key: string) => {
    cache.updateQuery({ query: GET_SANDBOXES }, data => {
      console.log(data)

      const sandboxes = data.listSandboxes.sandboxes.filter(
        (item: GetSandboxes_listSandboxes_sandboxes) => item.account_id !== key,
      )

      return { listSandboxes: { sandboxes } }
    })
  }

  if (data)
    return (
      <table className="table-auto">
        <thead>
          <tr>
            {[
              'account_id',
              'account_name',
              'assigned_until',
              'assigned_since',
              'assigned_to',
              'zurückgeben',
            ].map(item => (
              <th
                key={item}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.listSandboxes?.sandboxes?.map((sandbox) => {
            const account_id = sandbox?.account_id
            return (
              <tr className="alter" key={`sandbox_overview_${sandbox?.account_id}`}>
                <td className="px-6 py-4 whitespace-nowrap">{sandbox?.account_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{sandbox?.account_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {convertDate(sandbox?.assigned_until)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {convertDate(sandbox?.assigned_since)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{sandbox?.assigned_to}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DeallocateSandboxButton {...{ account_id, updateCache }} />
                </td>
              </tr>
            )
          },
          )}
        </tbody>
      </table>
    )
  if (loading) return <>Loading</>
  return <>{error}</>
}

export { SandboxList }
