export const postData = async <T, R>(
  url: string,
  data: T,
  onSuccess: (data: R) => void,
  onAddSuccess: () => void,
  onFailure: () => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string) => void
): Promise<void> => {
  setLoading(true);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add data');
    const result: R = await response.json();
    onSuccess(result);
    onAddSuccess();
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unknown error occurred');
    }
    onFailure();
  } finally {
    setLoading(false);
  }
};
