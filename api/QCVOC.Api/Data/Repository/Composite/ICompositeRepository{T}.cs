using System.Data;

namespace QCVOC.Server.Data.Repository.Composite
{
    public interface ICompositeRepository<T>
    {
        T Add(T composite);

        T Add(T composite, IDbTransaction transaction);

        void Remove(T composite);

        void Remove(T composite, IDbTransaction transaction);
    }
}