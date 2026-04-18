import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: '#050B14',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#06b6d4',
          fontWeight: 'bold',
          borderRadius: '20%',
        }}
      >
        E
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  )
}
