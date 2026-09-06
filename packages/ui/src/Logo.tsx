interface LogoProps {
  /** 'color' for light backgrounds, 'light' for dark backgrounds. */
  variant?: 'color' | 'light';
  /** Rendered height in px (width scales to the ~4.09:1 wordmark ratio). */
  height?: number;
  /** Accessible label; set to '' to hide from a11y tree when decorative. */
  title?: string;
  className?: string;
  /** Play the one-time reveal animation on mount. */
  animated?: boolean;
}

// Official YUKTI wordmark (vector, extracted from the brand PDF).
// Blue letterforms + a golden accent on the Y.
export function Logo({
  variant = 'color',
  height = 26,
  title = 'Yukti Digital Solutions',
  className = '',
  animated = false,
}: LogoProps) {
  const blue = variant === 'light' ? 'var(--color-paper, #f6f4ef)' : '#2f2fe4';
  const gold = '#ffc300';
  const width = Math.round(height * 4.09);

  return (
    <svg
      className={`yk-logo ${animated ? 'yk-logo--animated' : ''} ${className}`.trim()}
      width={width}
      height={height}
      viewBox="102 313 648 162"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : 'presentation'}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {/* Blue letterforms */}
      <g fill={blue} className="yk-logo__blue">
        <path transform="matrix(1,0,0,-1,0,824)" d="M180.591 317.726H142.065V356.252H180.591Z" />
        <path
          transform="matrix(1,0,0,-1,180.372,424.507)"
          d="M0 0C0-1.431-.036-2.862-.133-4.281H-36.265C-37.647 17.174-54.906 34.288-76.411 35.452V72.893C-75.27 72.954-74.13 72.978-72.978 72.978-32.675 72.978 0 40.303 0 0"
        />
        <path
          transform="matrix(1,0,0,-1,402.1316,451.0085)"
          d="M0 0C0-10.123-1.464-18.816-4.382-26.084-7.306-33.353-11.513-39.339-16.997-44.045-22.486-48.748-29.114-52.205-36.882-54.413-44.653-56.621-53.382-57.728-63.072-57.728-66.636-57.728-70.522-57.477-74.725-56.978-78.931-56.478-83.206-55.516-87.553-54.092-91.903-52.669-96.179-50.779-100.381-48.427-104.587-46.075-108.399-42.975-111.82-39.126-115.955-34.422-118.911-28.971-120.692-22.769-122.477-16.57-123.509-9.622-123.792-1.925V99.846C-105.726 99.846-91.081 85.201-91.081 67.135V.213C-91.081-5.206-90.369-9.836-88.943-13.684-87.519-17.531-85.558-20.706-83.063-23.198-80.571-25.693-77.647-27.548-74.298-28.757-70.951-29.97-67.422-30.574-63.714-30.574-52.596-30.574-44.653-28.045-39.874-22.985-35.1-17.926-32.713-10.69-32.713-1.283V67.133C-32.713 85.2-18.067 99.846 0 99.846Z"
        />
        <path
          transform="matrix(1,0,0,-1,467.9787,504.6735)"
          d="M0 0H-32.071V153.511C-14.358 153.511 0 139.153 0 121.441V91.081L30.201 123.265C48.311 142.564 73.597 153.511 100.061 153.511L37.416 90.653 103.696 0C77.824 0 53.567 12.58 38.663 33.728L14.968 67.349C5.37 57.477 0 44.251 0 30.482Z"
        />
        <path
          transform="matrix(1,0,0,-1,653.1315,504.6735)"
          d="M0 0H-32.071V126.358H-51.312C-66.308 126.358-78.465 138.515-78.465 153.511H46.396C46.396 138.515 34.24 126.358 19.244 126.358H0Z"
        />
        <path
          transform="matrix(1,0,0,-1,748.0588,504.6735)"
          d="M0 0H-32.071V121.441C-32.071 139.153-17.712 153.511 0 153.511Z"
        />
      </g>
      {/* Golden Y accent */}
      <g fill={gold} className="yk-logo__gold">
        <path transform="matrix(1,0,0,-1,0,824)" d="M223.177 317.726H184.651V356.252H223.177Z" />
        <path
          transform="matrix(1,0,0,-1,184.8718,424.507)"
          d="M0 0C0-1.431 .036-2.862 .133-4.281H36.265C37.647 17.174 54.906 34.288 76.411 35.452V72.893C75.27 72.954 74.13 72.978 72.978 72.978 32.675 72.978 0 40.303 0 0"
        />
      </g>
    </svg>
  );
}
