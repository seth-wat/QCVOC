namespace QCVOC.Server.Data.Repository.Composite
{
    public interface ICompositeRepository<T>
    {
        T Add(T composite);

        void Remove(T composite);
    }
}